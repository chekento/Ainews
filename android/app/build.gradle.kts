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
        versionCode = 5
        versionName = "2.2.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
