import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Mail, Star, User } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { interests: { include: { interest: true } } },
  });

  if (!user) redirect("/login");

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex-1 overflow-y-auto bg-neutral/40">
      <div className="max-w-xl mx-auto px-6 py-12">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center mb-10">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full shadow-md mb-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-tint flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl font-bold text-primary-blue">{initials}</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-primary-blue">{user.name}</h1>
          <p className="text-sm text-primary-blue/50 mt-0.5">
            UG {user.batchYear ?? "2026"} · Ashoka University
          </p>
        </div>

        {/* Info cards */}
        <div className="flex flex-col gap-3 mb-8">
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
          <InfoRow
            icon={<Star className="w-4 h-4" />}
            label="Total Points"
            value={`${user.totalPoints} pts`}
          />
          <InfoRow
            icon={<User className="w-4 h-4" />}
            label="Onboarding"
            value={user.onboardingDone ? "Complete" : "In progress"}
            valueClass={user.onboardingDone ? "text-emerald-600" : "text-amber-500"}
          />
        </div>

        {/* Interests */}
        {user.interests.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-primary-blue/30 mb-3">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {user.interests.map(({ interest }) => (
                <span
                  key={interest.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-tint px-3 py-1 text-xs font-medium text-primary-blue"
                >
                  <span>{interest.emoji}</span>
                  {interest.label}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3.5 shadow-sm">
      <span className="text-primary-blue/40">{icon}</span>
      <span className="text-sm text-primary-blue/50 flex-1">{label}</span>
      <span className={`text-sm font-semibold text-primary-blue ${valueClass ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
