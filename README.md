# Getting Started

## step1: creat a next app
    >> pnpm create next-app@latest .
    >> To run : pnpm dev or npm run dev
    >> open on http://localhost:3000

## step2: get database url neon db

## step3: set up drizzle
    >> pnpm add drizzle-orm@rc pg dotenv
    >> pnpm add -D drizzle-kit@rc tsx @types/pg

    >> creaet drizzle.config.ts

## step4: connect drizzle to postgress
    >> db/index.ts

## step6: Get github oAuth credentials
    >> settings -> developer settings -> oAuth App -> new oAuthApp 
    >> home page url , 
    >> Authorization callback url or Redirect URL
        >> http://localhost:3000/api/auth/callback/github
        
    >> get client id and client secret

## step5: Better-Auth and oAuth
    >> pnpm add better-auth @better-auth/drizzle-adapter
    >> in root lib/auth.ts -> configure better auth 
    >> add service providers( github google , user email password )
    >> generate schema ( pnpm dlx auth@latest generate )        -> this will generate the auth-schema.ts

    >> pnpm drizzle-kit generate
    >> onom drizzle-kit migrate

    >> add teh schema in the auth.ts ( import * as authSchame from ....)

## step6: add an endpoint for betterauth to communicate with the applcation
    >> api/auth/[..all]/path.ts         // ..all -> catch alll comming here

## add sahdcn
    >> pnpm dlx shadcn@latest init      // init shadcn
    >> add components pnpm dlx shadcn@latest add button
    
## create the sign in oage.
    >> get callback form search params
    >> create the sign in page

    so far the oAuth setup os done and ready for sign in with github


# implememnt protected roures
    >> check if session exists and user goes to public pages redirect back to dashboard
    >> if sessionn does not exists and user go to protected routes attach the path and callback to url and redirect to sign-in
    >> after sign in redirect to the attached path and callback



# step 2.add dark theme 
    >> install next-themes
    >> creaet theme provider 
    >> wrap the root layout in theme provider




# create gitub app
    from github developer settings create github app and get appid, secret and private key

## installation 
    >> lib/github-app.ts 
        >> create a github app using {App} from octokit and private key
        >> creaet a installation url from where app can be installed
        const url = new URL("https://github.com/apps/repomind-github-app/installations/new");
        url.searchParams.set("state", userId)       // can use a diff state and save a mapping of state and the user

## create connection
    >> connection where you call the install function and get the installation url and when user clicks on connect giyhub in frontend thisis invoked

    >> once app is installed it return to the setup url /api/github/callback
    >> in callback returns installation id

    >> using octokit get details of the installation
    >> save to db

# create disconnection function  ad other helper function
    >> disconnects gthub app and deletes from db
    >> getInstallationIdByUser getUserByInstallationId and all
    


