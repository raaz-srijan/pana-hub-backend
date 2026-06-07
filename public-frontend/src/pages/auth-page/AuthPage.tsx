import AuthBanner from "./components/AuthBanner";
import AuthForm, { type AuthProps } from "./components/AuthForm";

const AuthPage = ({ type }: AuthProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-8 items-center bg-card-bg/50 border border-ui-muted/10 p-4 rounded-[2.5rem] shadow-3xs">
        
        {/* Left Side Visual Banner (Hidden on Mobile) */}
        <AuthBanner type={type} />

        {/* Right Side Input Validation Form Control */}
        <div className="flex justify-center items-center w-full py-6 lg:p-8">
          <AuthForm type={type} />
        </div>
        
      </div>
    </div>
  );
};

export default AuthPage;