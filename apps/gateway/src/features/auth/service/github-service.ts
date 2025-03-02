import {Oauth2Config} from "../../../core/config/Oauth2.config";

class GithubService {
    constructor(private config: Oauth2Config) {
    }
    // oauthClient: Auth.DAuth2client
    async init(){
        const clientId = this.config.githubClient
        const clientSecret = this.config.githubClientSecret
    }
}