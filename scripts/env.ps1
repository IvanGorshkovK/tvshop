# Раскладка путей к переносимой Java и Maven.
# Подключать так:  . .\scripts\env.ps1
$root = "C:\Users\Иван\Desktop\AIGHS"
$jdk = Get-ChildItem "$root\.tools\jdk" -Directory | Select-Object -First 1 -ExpandProperty FullName
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$root\.tools\maven\apache-maven-3.9.9\bin;$env:Path"
