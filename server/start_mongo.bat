@echo off
if not exist "mongo_data" mkdir mongo_data
echo Attempting to start MongoDB...

if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
    echo Found MongoDB 8.0
    "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath ./mongo_data
) else if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    echo Found MongoDB 7.0
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath ./mongo_data
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    echo Found MongoDB 6.0
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath ./mongo_data
) else if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    echo Found MongoDB 5.0
    "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath ./mongo_data
) else (
    echo MongoDB not found in standard locations. Please install MongoDB or add it to correctly your PATH.
)
pause
