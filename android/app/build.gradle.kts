plugins {
    id("com.android.application")
}

android {
    namespace = "cloud.kosch.ainews"
    compileSdk = 35

    defaultConfig {
        applicationId = "cloud.kosch.ainews"
        minSdk = 26
        targetSdk = 35
        versionCode = 15
        versionName = "3.7.2"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

}
    
dependencies {
    implementation("com.google.ai.edge.litertlm:litertlm-android:0.16.0")
}
