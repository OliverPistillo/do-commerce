FROM node:18

# Installa Java + Firebase CLI
RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    npm install -g firebase-tools

# Set JAVA_HOME esplicitamente
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Copia i file necessari dalla cartella `firebase/` (dove si trova il Dockerfile)
COPY firebaserc.json .firebaserc
COPY firebase.json .
COPY firestore.rules .
COPY firestore.indexes.json .

# Copia anche le funzioni
COPY ./functions ./functions

# Installa le dipendenze delle funzioni
WORKDIR /app/functions
RUN npm install

# Torna nella root dell'emulatore
WORKDIR /app

# Esegui gli emulatori su progetto specifico
CMD ["firebase", "emulators:start", "--import=./data", "--export-on-exit"]
