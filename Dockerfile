FROM node:10.18.0
LABEL version="1.3"
LABEL description="Groups Manager Service"
RUN sed -i '/jessie-updates/d' /etc/apt/sources.list

RUN apt-get update && \
    apt-get upgrade -y

# install aws
RUN apt-get install -y \
    ssh \
    python \
    python-dev \
    python-pip

# RUN pip install awscli

RUN apt-get install libpq-dev

# - Install the latest npm version
# RUN npm install -g npm@latest

# RUN npm cache clean --force


# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#COPY package*.json ./
#RUN npm install --verbose


# Bundle app source
COPY . /usr/src/app
# Install app dependencies
RUN npm install --verbose

EXPOSE 3000

ENTRYPOINT ["npm","run"]
#CMD ["npm", "start"]
