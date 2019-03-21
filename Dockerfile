FROM node

WORKDIR /home/kernel-relay
ADD . .

CMD npm run clean
CMD npm install
CMD npm run build:prod

EXPOSE 4000
ENTRYPOINT ["node", "lib/index.js"]
