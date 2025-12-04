import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@pf-dev/ui";
import { useCounterStore } from "./store/counter";

const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
});

type FormData = z.infer<typeof formSchema>;

function App() {
  const { count, increment, decrement, reset } = useCounterStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert(`환영합니다, ${data.name}님!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">PF-Dev Test App</h1>

        {/* Counter Section - Zustand */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Counter (Zustand)</h2>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={decrement}>
              -
            </Button>
            <span className="text-2xl font-bold">{count}</span>
            <Button variant="secondary" onClick={increment}>
              +
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </section>

        {/* Form Section - React Hook Form + Zod */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Form (React Hook Form + Zod)
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                {...register("name")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit">제출</Button>
          </form>
        </section>

        {/* UI Components Demo */}
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">UI Components (@pf-dev/ui)</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default" size="sm">
              Default SM
            </Button>
            <Button variant="default" size="md">
              Default MD
            </Button>
            <Button variant="default" size="lg">
              Default LG
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
