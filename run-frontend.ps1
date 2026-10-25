# Запуск фронтенда (Vite dev-server на http://localhost:5173).
$root = "C:\Users\Иван\Desktop\AIGHS"
$nodeBin = "C:\Users\Иван\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin"
$node = "$nodeBin\node.exe"
$pnpm = "C:\Users\Иван\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs"

# Добавляем node в PATH, чтобы postinstall-скрипты (например, esbuild) могли найти "node".
$env:Path = "$nodeBin;$env:Path"

Set-Location "$root\frontend"
& $node $pnpm dev
