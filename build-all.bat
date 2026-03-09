@echo off

REM Get current DateTime in yyyyMMddHHmmss format
for /f "tokens=2 delims==." %%A in ('wmic os get localdatetime /value') do set DATETIME=%%A

pushd ubuntu
REM Build ubuntu-fat target
call docker build --progress=plain -f Dockerfile.ubuntu-fat -t tianshufu/ubuntu-fat:latest -t tianshufu/ubuntu-fat:%DATETIME% --secret id=zscaler_cert,src=%USERPROFILE%\.secrets\ZscalerRootCA.cer .
if errorlevel 1 (
    echo Error: Failed to build ubuntu-fat target
    exit /b 1
)
popd

pushd ai-coding
REM Build opencode-fat target
call docker build --progress=plain -f Dockerfile.opencode-fat -t tianshufu/opencode-fat:latest -t tianshufu/opencode-fat:%DATETIME% .
if errorlevel 1 (
    echo Error: Failed to build opencode-fat target
    exit /b 1
)
popd


pushd node
REM Build node-fat target
call docker build --progress=plain -f Dockerfile.node-fat -t tianshufu/node-fat:latest -t tianshufu/node-fat:%DATETIME% .
if errorlevel 1 (
    echo Error: Failed to build node-fat target
    exit /b 1
)
popd


pushd flutter
REM Build flutter-fat target
set FLUTTER_VER=3.41.2-stable
set FLUTTER_FILE=flutter_linux_%FLUTTER_VER%.tar.xz

if not exist .cache mkdir .cache
if not exist .cache\%FLUTTER_FILE% (
    echo Downloading %FLUTTER_FILE%...
    curl -L https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/%FLUTTER_FILE% -o .cache/%FLUTTER_FILE%
)
call docker build --progress=plain -f Dockerfile.flutter-fat -t tianshufu/flutter-fat:latest -t tianshufu/flutter-fat:%DATETIME% .
if errorlevel 1 (
    echo Error: Failed to build flutter-fat target
    exit /b 1
)
popd
