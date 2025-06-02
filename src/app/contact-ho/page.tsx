
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase as DepartmentIcon, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Package2 } from "lucide-react";

interface ContactPerson {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatarSeed: string; // For generating consistent placeholder avatars
}

const headOfficeContacts: ContactPerson[] = [
  {
    id: "ho-001",
    name: "Eleanor Vance",
    role: "Chief Executive Officer",
    department: "Executive Office",
    email: "e.vance@storeflow.corp",
    phone: "(555) 010-0001",
    avatarSeed: "eleanor",
  },
  {
    id: "ho-002",
    name: "Marcus Thorne",
    role: "Chief Operations Officer",
    department: "Operations",
    email: "m.thorne@storeflow.corp",
    phone: "(555) 010-0002",
    avatarSeed: "marcus",
  },
  {
    id: "ho-003",
    name: "Sophia Chen",
    role: "Head of Property Development",
    department: "Property",
    email: "s.chen@storeflow.corp",
    phone: "(555) 010-0003",
    avatarSeed: "sophia",
  },
  {
    id: "ho-004",
    name: "James Rodriguez",
    role: "Head of Project Management",
    department: "Projects",
    email: "j.rodriguez@storeflow.corp",
    phone: "(555) 010-0004",
    avatarSeed: "james",
  },
  {
    id: "ho-005",
    name: "Olivia Miller",
    role: "Head of Merchandising",
    department: "Merchandising",
    email: "o.miller@storeflow.corp",
    phone: "(555) 010-0005",
    avatarSeed: "olivia",
  },
  {
    id: "ho-006",
    name: "David Lee",
    role: "Head of Human Resources",
    department: "HR",
    email: "d.lee@storeflow.corp",
    phone: "(555) 010-0006",
    avatarSeed: "david",
  },
  {
    id: "ho-007",
    name: "Isabelle Moreau",
    role: "Head of Marketing",
    department: "Marketing",
    email: "i.moreau@storeflow.corp",
    phone: "(555) 010-0007",
    avatarSeed: "isabelle",
  },
  {
    id: "ho-008",
    name: "Kenji Tanaka",
    role: "Head of IT",
    department: "IT",
    email: "k.tanaka@storeflow.corp",
    phone: "(555) 010-0008",
    avatarSeed: "kenji",
  },
];

export default function ContactHeadOfficePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading..." : "Please sign in."}</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="contact-ho-page-heading">
      <h1 id="contact-ho-page-heading" className="text-2xl font-semibold md:text-3xl mt-4">Contact Head Office</h1>
      <p className="text-muted-foreground">
        Key contacts at the StoreFlow head office.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {headOfficeContacts.map((contact) => (
          <Card key={contact.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 pb-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://picsum.photos/seed/${contact.avatarSeed}/100/100`} alt={contact.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{contact.name}</CardTitle>
                <CardDescription>{contact.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <DepartmentIcon className="mr-2 h-4 w-4" />
                <span>{contact.department}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <a href={`mailto:${contact.email}`} className="hover:text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
