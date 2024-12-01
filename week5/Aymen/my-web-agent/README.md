This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

During this project i've built an agent that search the wiki page in order to find description of certain animals . 

the code work as follow 

1- User load image 
2- the image get classified as one of these animals ["dog","cat","snake","lion","camel","rabit","horse","cow","chicken","Something else"] in case the class is image class turn to be something else i return message 
telling the user that this is not image of animal
3- the class send to the agent
4- the agent search using wiki api information about this animal and return them to user
 