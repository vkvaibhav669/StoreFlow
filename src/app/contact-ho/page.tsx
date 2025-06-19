
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase as DepartmentIcon } from "lucide-react"; // Removed UserCircle
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Package2 } from "lucide-react";
import type { ProjectMember as ContactPerson } from "@/types"; // Using ProjectMember as it fits well
import { mockHeadOfficeContacts } from "@/lib/data"; // Import Indianized mock data

// The headOfficeContacts data will now come from mockHeadOfficeContacts in lib/data.ts
// const headOfficeContacts: ContactPerson[] = [ ... ]; // This local array is no longer needed

export default function ContactHeadOfficePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = React.useState<ContactPerson[]>([]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    } else if (user) {
      // For mock data, we can directly set it.
      // If this were API driven, we'd fetch here.
      setContacts(mockHeadOfficeContacts);
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
        {contacts.map((contact) => (
          <Card key={contact.id || contact.email} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 pb-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://picsum.photos/seed/${contact.avatarSeed || contact.email}/100/100`} alt={contact.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{contact.name}</CardTitle>
                <CardDescription>{contact.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              {contact.department && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <DepartmentIcon className="mr-2 h-4 w-4" />
                  <span>{contact.department}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <a href={`mailto:${contact.email}`} className="hover:text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
