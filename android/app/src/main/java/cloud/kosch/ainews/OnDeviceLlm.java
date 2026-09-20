package cloud.kosch.ainews;

import android.content.Context;

import com.google.ai.edge.litertlm.Backend;
import com.google.ai.edge.litertlm.Conversation;
import com.google.ai.edge.litertlm.ConversationConfig;
import com.google.ai.edge.litertlm.Engine;
import com.google.ai.edge.litertlm.EngineConfig;
import com.google.ai.edge.litertlm.Message;
import com.google.ai.edge.litertlm.MessageCallback;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Owns the optional, fully local AI News Copilot model.
 *
 * The model is never bundled into the APK. It is downloaded only after the user asks for it,
 * stored in the app-private files directory, and used through LiteRT-LM without an API endpoint.
 */
public final class OnDeviceLlm {
    public interface Callback {
        void onEvent(String json);
    }

    public static final String MODEL_ID = "qwen3-0.6b-int4";
    public static final String MODEL_NAME = "Qwen3 0.6B · dynamic INT4";
    public static final String MODEL_FILE = "Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm";
    public static final String MODEL_URL =
        "https://huggingface.co/litert-community/Qwen3-0.6B/resolve/main/" + MODEL_FILE;
    public static final String MODEL_LICENSE = "Apache-2.0";
    public static final String MODEL_SOURCE = "LiteRT Community / Hugging Face";
    public static final String RUNTIME_VERSION = "LiteRT-LM 0.16.0";
    public static final long EXPECTED_MIN_BYTES = 100L * 1024L * 1024L;

    private final Context context;
    private final Callback callback;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy = new AtomicBoolean(false);
    private volatile Future<?> downloadFuture;
    private volatile boolean cancelDownload;
    private volatile boolean closed;
    private volatile String state = "missing";
    private volatile String backend = "not loaded";
    private volatile String error = "";
    private volatile double progress = 0.0;
    private volatile Engine engine;
    private volatile Conversation conversation;

    public OnDeviceLlm(Context context, Callback callback) {
        this.context = context.getApplicationContext();
        this.callback = callback;
        if (modelFile().isFile() && modelFile().length() >= EXPECTED_MIN_BYTES) {
            state = "downloaded";
        }
    }

    public String statusJson() {
        try {
            return statusObject().toString();
        } catch (Exception ignored) {
            return "{\"state\":\"unavailable\",\"error\":\"Status unavailable\"}";
        }
    }

    public void downloadModel() {
        if (closed) return;
        downloadFuture = executor.submit(() -> {
            try {
                cancelDownload = false;
                File target = modelFile();
                if (target.isFile() && target.length() >= EXPECTED_MIN_BYTES) {
                    progress = 1.0;
                    setState("downloaded");
                    ensureReady();
                    return;
                }

                File dir = target.getParentFile();
                if (dir != null && !dir.exists() && !dir.mkdirs()) {
                    throw new IOException("Could not create the private model directory.");
                }
                File partial = new File(dir, MODEL_FILE + ".part");
                if (partial.exists() && !partial.delete()) {
                    throw new IOException("Could not replace the incomplete model download.");
                }

                setState("downloading");
                HttpURLConnection connection = null;
                long received = 0L;
                try {
                    connection = (HttpURLConnection) new URL(MODEL_URL).openConnection();
                    connection.setInstanceFollowRedirects(true);
                    connection.setConnectTimeout(25_000);
                    connection.setReadTimeout(90_000);
                    connection.setRequestProperty("User-Agent", "AI-News-Android/3.7");
                    connection.setRequestProperty("Accept", "application/octet-stream");
                    int code = connection.getResponseCode();
                    if (code < 200 || code >= 300) {
                        throw new IOException("Model host returned HTTP " + code);
                    }
                    long total = connection.getContentLengthLong();
                    try (BufferedInputStream input = new BufferedInputStream(connection.getInputStream());
                         BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(partial))) {
                        byte[] buffer = new byte[128 * 1024];
                        int count;
                        while ((count = input.read(buffer)) != -1) {
                            if (cancelDownload || closed) throw new IOException("Model download cancelled.");
                            output.write(buffer, 0, count);
                            received += count;
                            progress = total > 0 ? Math.min(0.999, (double) received / (double) total) : 0.0;
                            if (received % (1024L * 1024L) < count) emitStatus();
                        }
                    }
                } finally {
                    if (connection != null) connection.disconnect();
                }

                if (received < EXPECTED_MIN_BYTES) {
                    throw new IOException("Downloaded model is incomplete (" + received + " bytes).");
                }
                if (target.exists() && !target.delete()) {
                    throw new IOException("Could not replace the previous model.");
                }
                if (!partial.renameTo(target)) {
                    throw new IOException("Could not finalize the model download.");
                }
                progress = 1.0;
                error = "";
                setState("downloaded");
                ensureReady();
            } catch (Throwable throwable) {
                if (closed) return;
                error = readableError(throwable);
                if (cancelDownload) {
                    state = modelFile().isFile() ? "downloaded" : "missing";
                    progress = modelFile().isFile() ? 1.0 : 0.0;
                    emitStatus();
                } else {
                    setState("error");
                }
            }
        });
    }

    public void prepareModel() {
        if (closed) return;
        executor.submit(() -> {
            try {
                ensureReady();
            } catch (Throwable throwable) {
                error = readableError(throwable);
                setState("error");
            }
        });
    }

    public void cancelDownload() {
        cancelDownload = true;
        Future<?> future = downloadFuture;
        if (future != null) future.cancel(true);
    }

    public void removeModel() {
        if (closed) return;
        executor.submit(() -> {
            cancelDownload = true;
            closeEngine();
            File model = modelFile();
            File partial = new File(model.getParentFile(), MODEL_FILE + ".part");
            if (model.exists()) model.delete();
            if (partial.exists()) partial.delete();
            progress = 0.0;
            error = "";
            backend = "not loaded";
            setState("missing");
        });
    }

    public void ask(String requestId, String prompt) {
        if (closed) {
            emitError(requestId, "On-device model is unavailable.");
            return;
        }
        if (!busy.compareAndSet(false, true)) {
            emitError(requestId, "The on-device model is already generating a response.");
            return;
        }
        executor.submit(() -> {
            try {
                if (!modelFile().isFile()) throw new IOException("Download the on-device model first.");
                ensureReady();
                setState("generating");
                Conversation active = conversation;
                if (active == null) throw new IllegalStateException("Conversation could not be created.");
                active.sendMessageAsync(prompt, new MessageCallback() {
                    @Override public void onMessage(Message message) {
                        emitToken(requestId, message == null ? "" : message.toString());
                    }

                    @Override public void onDone() {
                        busy.set(false);
                        error = "";
                        setState("ready");
                        emitDone(requestId);
                    }

                    @Override public void onError(Throwable throwable) {
                        busy.set(false);
                        error = readableError(throwable);
                        state = engine != null ? "ready" : "error";
                        emitStatus();
                        emitError(requestId, error);
                    }
                });
            } catch (Throwable throwable) {
                busy.set(false);
                error = readableError(throwable);
                state = engine != null ? "ready" : "error";
                emitStatus();
                emitError(requestId, error);
            }
        });
    }

    public void cancelGeneration() {
        executor.submit(() -> {
            Conversation active = conversation;
            if (active != null && busy.get()) {
                try {
                    active.cancelProcess();
                } catch (Exception ignored) { }
            }
        });
    }

    public void close() {
        closed = true;
        cancelDownload = true;
        Future<?> future = downloadFuture;
        if (future != null) future.cancel(true);
        closeEngine();
        executor.shutdownNow();
    }

    private void ensureReady() {
        if (closed) throw new IllegalStateException("On-device model is closed.");
        if (engine != null && conversation != null) {
            if (!"generating".equals(state)) setState("ready");
            return;
        }
        if (!modelFile().isFile()) throw new IllegalStateException("Model file is missing.");

        // Qwen3 0.6B is a text-only LiteRT-LM artifact. Do not configure vision or
        // audio executors: doing so asks the runtime for TF_LITE_AUDIO_ENCODER_HW,
        // which this model does not contain.
        if (engine != null || conversation != null) closeEngine();
        setState("loading");
        backend = "not loaded";

        Engine next = null;
        Throwable gpuFailure = null;
        try {
            next = new Engine(new EngineConfig(modelFile().getAbsolutePath(), new Backend.GPU(), null, null, null, null, null));
            next.initialize();
            backend = "GPU";
        } catch (Throwable throwable) {
            gpuFailure = throwable;
            if (next != null) {
                try { next.close(); } catch (Exception ignored) { }
            }
            next = null;
        }

        if (next == null) {
            try {
                next = new Engine(new EngineConfig(modelFile().getAbsolutePath(), new Backend.CPU(), null, null, null, null, null));
                next.initialize();
                backend = "CPU";
            } catch (Throwable cpuFailure) {
                if (next != null) {
                    try { next.close(); } catch (Exception ignored) { }
                }
                String gpuMessage = gpuFailure == null ? "not attempted" : readableError(gpuFailure);
                throw new IllegalStateException(
                    "Text-only model initialization failed. GPU: " + gpuMessage +
                    " · CPU: " + readableError(cpuFailure), cpuFailure
                );
            }
        }

        engine = next;
        try {
            conversation = engine.createConversation(new ConversationConfig());
        } catch (Throwable conversationFailure) {
            closeEngine();
            throw new IllegalStateException(
                "Text-only conversation could not be created: " + readableError(conversationFailure),
                conversationFailure
            );
        }
        error = "";
        setState("ready");
    }

    private void closeEngine() {
        Conversation activeConversation = conversation;
        conversation = null;
        if (activeConversation != null) {
            try { activeConversation.close(); } catch (Exception ignored) { }
        }
        Engine activeEngine = engine;
        engine = null;
        if (activeEngine != null) {
            try { activeEngine.close(); } catch (Exception ignored) { }
        }
        busy.set(false);
    }

    private File modelFile() {
        File dir = new File(context.getFilesDir(), "ondevice-models");
        return new File(dir, MODEL_FILE);
    }

    private void setState(String next) {
        state = next;
        emitStatus();
    }

    private JSONObject statusObject() throws JSONException {
        JSONObject object = new JSONObject();
        object.put("state", state);
        object.put("progress", progress);
        object.put("backend", backend);
        object.put("error", error == null ? "" : error);
        object.put("modelId", MODEL_ID);
        object.put("modelName", MODEL_NAME);
        object.put("modelFile", MODEL_FILE);
        object.put("modelUrl", MODEL_URL);
        object.put("modelSource", MODEL_SOURCE);
        object.put("license", MODEL_LICENSE);
        object.put("runtime", RUNTIME_VERSION);
        object.put("mode", "text-only");
        object.put("sizeLabel", "~328 MB");
        object.put("modelBytes", modelFile().isFile() ? modelFile().length() : 0);
        object.put("installed", modelFile().isFile());
        object.put("busy", busy.get());
        return object;
    }

    private void emitStatus() {
        emit("status", null, null);
    }

    private void emitToken(String requestId, String text) {
        emit("token", requestId, text);
    }

    private void emitDone(String requestId) {
        emit("done", requestId, null);
    }

    private void emitError(String requestId, String message) {
        emit("error", requestId, message);
    }

    private void emit(String type, String requestId, String text) {
        try {
            JSONObject object = statusObject();
            object.put("type", type);
            if (requestId != null) object.put("requestId", requestId);
            if (text != null) object.put("text", text);
            callback.onEvent(object.toString());
        } catch (Exception ignored) { }
    }

    private static String readableError(Throwable throwable) {
        String message = throwable == null ? "" : throwable.getMessage();
        if (message == null || message.trim().isEmpty()) message = throwable == null ? "Unknown on-device model error." : throwable.getClass().getSimpleName();
        return message.length() > 320 ? message.substring(0, 320) : message;
    }
}
