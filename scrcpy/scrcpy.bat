adb forward tcp:8091 localabstract:scrcpy
adb push scrcpy-server.jar /data/local/tmp/
adb shell CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / com.genymobile.scrcpy.Server 0 1000000 true
