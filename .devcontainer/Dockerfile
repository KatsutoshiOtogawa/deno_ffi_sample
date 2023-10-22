FROM --platform=linux/amd64 mcr.microsoft.com/vscode/devcontainers/base:0-bullseye

ENV DENO_INSTALL=/deno
RUN mkdir -p /deno \
    && curl -fsSL https://deno.land/x/install/install.sh | sh \
    && chown -R vscode /deno

ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update  &&  apt upgrade -y

RUN apt install -y pkg-config

ENV NODE_VERSION=v20.7.0

RUN wget "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz"

RUN tar Jxvf "node-${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local/ --strip-components=1 && rm "node-${NODE_VERSION}-linux-x64.tar.xz"

ENV TYPESCRIPT_VERSION=5.2.2
RUN npm install -g typescript@${TYPESCRIPT_VERSION} 
RUN apt install -y neovim

# install for dotnet AOT
RUN apt install -y clang zlib1g-dev


ENV GRAALVM_VERSION=21

RUN wget "https://download.oracle.com/graalvm/${GRAALVM_VERSION}/latest/graalvm-jdk-${GRAALVM_VERSION}_linux-x64_bin.tar.gz"

RUN tar zxvf "graalvm-jdk-${GRAALVM_VERSION}_linux-x64_bin.tar.gz" -C /usr/local && rm "graalvm-jdk-${GRAALVM_VERSION}_linux-x64_bin.tar.gz"

RUN mv /usr/local/graalvm-jdk-21.0.1+12.1 /usr/local/graalvm-jdk


ENV JAVA_HOME=/usr/local/graalvm-jdk
ENV PATH=${JAVA_HOME}/bin:${PATH}

ENV MAVEN_VERSION=3.9.5
RUN wget "https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"

RUN tar zxvf "apache-maven-${MAVEN_VERSION}-bin.tar.gz" -C /usr/local && rm "apache-maven-${MAVEN_VERSION}-bin.tar.gz"

RUN mv /usr/local/apache-maven-${MAVEN_VERSION} /usr/local/maven

ENV PATH=/usr/local/maven/bin:${PATH}
