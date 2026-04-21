import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-reddit-card border border-reddit-border rounded p-8 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
