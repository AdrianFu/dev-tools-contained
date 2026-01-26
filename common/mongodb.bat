docker run -d -p 27017:27017 --network dev-net --name mongo mongo
rem docker run -d --network dev-net --name mongo -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret mongo
