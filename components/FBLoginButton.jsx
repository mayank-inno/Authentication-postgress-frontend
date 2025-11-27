"use client";
import FacebookLogin from "@greatsumini/react-facebook-login"
import { toast } from "react-toastify";

const FBLoginButton = ({ fireConfetti }) => {
    return (
        <FacebookLogin
            appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
            onSuccess={(response) => {
                fireConfetti();
                console.log('Login Success!', response);
            }}
            onFail={(error) => {
                toast.error("Facebook Login Failed");
                console.log("FB Error", error);
            }}
            style={{
                padding: '12px 24px',
            }}
            className="flex items-center justify-between text-[#fff] text-[16px] rounded-[4px] bg-[#4267b2] cursor-pointer"
        >
            <i className="fa-brands fa-facebook-f"></i>
            <p className="text-center grow">Login with Facebook</p>
        </FacebookLogin>
    )
}

export default FBLoginButton;
