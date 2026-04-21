import RegisterForm from '../components/Auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-reddit-card border border-reddit-border rounded p-8 w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
