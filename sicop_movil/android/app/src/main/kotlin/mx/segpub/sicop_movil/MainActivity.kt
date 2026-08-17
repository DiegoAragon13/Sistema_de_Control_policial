package mx.segpub.sicop_movil

import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileOutputStream

class MainActivity : FlutterActivity() {
    private val CHANNEL = "mx.segpub.sicop/intent"
    private var pendingFilePath: String? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                if (call.method == "getOpenedFile") {
                    val path = handleIntent(intent)
                    result.success(path)
                } else {
                    result.notImplemented()
                }
            }

        // Procesar intent inicial
        pendingFilePath = handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        // Notificar a Flutter del nuevo archivo
        val path = handleIntent(intent)
        if (path != null) {
            pendingFilePath = path
        }
    }

    private fun handleIntent(intent: Intent?): String? {
        if (intent == null) return null
        if (intent.action != Intent.ACTION_VIEW) return null

        val uri = intent.data ?: return null

        // Copiar el archivo a un path accesible
        return try {
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            val tempFile = File(cacheDir, "import_temp.sicop")
            FileOutputStream(tempFile).use { output ->
                inputStream.copyTo(output)
            }
            inputStream.close()
            tempFile.absolutePath
        } catch (e: Exception) {
            null
        }
    }
}
