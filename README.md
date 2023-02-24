# LANmine
See who's talking

## This is a node.js application
node.js needs to be installed

Right now all it does is try to ping all hosts in a given subnet

need to `npm install ping` \
need to `npm install express`

first set env variables: 

`export LM_SUBNET='10.1.1.0/24` \
`export LM_POLL_INTERVAL=5`

to run: `node index.js`

Then navigate to http://localhost:3000

or

http://localhost:3000/api/v1/ips

Docker build:

`docker build -t <name> .`

Docker run:
`docker run  -e LM_POLL_INTERVAL='5'  -e LM_SUBNET='10.1.1.0/24' -p 3000:3000 <imagename>`

Screenshot:

![Alt text](/media/Screenshot1.png "Main view")