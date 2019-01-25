FROM ubuntu:14.04
LABEL maintainer "Carl Su <Carl.Su@kaiostech.com>"
# https://developer.mozilla.org/en-US/docs/Mozilla/B2G_OS/B2G_OS_build_prerequisites#Requirements_for_GNULinux

ENV DEBIAN_FRONTEND noninteractive

RUN \
  dpkg --add-architecture i386 && \
  dpkg --add-architecture amd64

RUN \
  apt-get update -qq && \
  apt-get install -qqy --no-install-recommends \
    autoconf2.13 bison bzip2 ccache curl flex gawk gcc g++ g++-multilib git \
    lib32ncurses5-dev lib32z1-dev libgconf2-dev zlib1g:amd64 zlib1g-dev:amd64 \
    zlib1g:i386 zlib1g-dev:i386 libgl1-mesa-dev libx11-dev make zip lzop \
    libxml2-utils openjdk-7-jdk unzip python libxt6 wget xz-utils \
    openssh-client && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Node.js
# https://github.com/nodejs/docker-node/blob/90d5e3df903b830d039d3fe8f30e3a62395db37e/7.5/Dockerfile
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 7.5.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs
