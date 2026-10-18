"use server"

import { disconnectGithubApp } from "../server/github-connection";

export async function uninstallGithubApp( userId: string ) {
  
    await disconnectGithubApp( userId )
}