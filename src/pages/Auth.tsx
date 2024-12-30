import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-egalio-purple/10 via-egalio-teal/10 to-egalio-coral/10">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-egalio-purple via-egalio-teal to-egalio-coral">
          Welcome to Egalio
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6366f1',
                  brandAccent: '#4f46e5',
                },
              },
            },
          }}
          redirectTo="https://anarcho.live"
          providers={[]}
          magicLink={false}
          showLinks={true}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign up',
              },
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Sign in',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;