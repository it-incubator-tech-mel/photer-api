
import axios from "axios";
import {Oauth2Config} from "../../../../core/config/Oauth2.config";
import {OauthTokenData} from "../../api/dto/variable types/Oauth.type";

class GoogleService {
    constructor(private config: Oauth2Config) {
    }
    // oauthClient: Auth.DAuth2client
    async validate(code: string){
        try {
            const requestData = {
                clientId: this.config.googleClient,
                clientSecret: this.config.googleClient,
                redirectUrl: 'https://photer.ltd/api/v1/auth/oauth/google/callback',
                code
            }

            const result = await axios.get<OauthTokenData>(
                ``
            )
        }catch (e){
            console.log(e)
        }
    }
}