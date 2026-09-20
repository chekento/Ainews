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
        versionCode = 17
        versionName = "3.8.0"
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
    
