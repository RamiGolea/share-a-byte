import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, PlusCircle, Search } from "lucide-react";
import { useOutletContext, Link } from "react-router";
import type { AuthOutletContext } from "./_user";

export default function () {
  const { gadgetConfig, user } = useOutletContext<AuthOutletContext>();

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <div>
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between p-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">You are now signed in</h2>
                <div className="space-y-2">
                  <p className="text-base">
                    You made it into <b>{gadgetConfig.env.GADGET_APP}</b>!
                  </p>
                  <p className="text-base">
                    Now, you can start building your app&apos;s signed in area.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(
                      "/edit/files/web/routes/_user.signed-in.tsx",
                      "_blank"
                    );
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit this page
                </Button>
              </div>
              <img
                src="https://assets.gadget.dev/assets/default-app-assets/react-logo.svg"
                className="app-logo h-24 w-24"
                alt="logo"
              />
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <Link to="/post" className="h-full">
            <Card className="flex h-full flex-col items-center justify-center p-10 transition-all hover:bg-muted/50">
              <PlusCircle className="mb-4 h-16 w-16 text-primary" />
              <h2 className="text-2xl font-bold">Post</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Create a new post to share with others
              </p>
            </Card>
          </Link>
          <Link to="/search" className="h-full">
            <Card className="flex h-full flex-col items-center justify-center p-10 transition-all hover:bg-muted/50">
              <Search className="mb-4 h-16 w-16 text-primary" />
              <h2 className="text-2xl font-bold">Search</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Find content from other users
              </p>
            </Card>
          </Link>
        </div>
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Current user</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  ID
                </dt>
                <dd className="text-base">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Name
                </dt>
                <dd className="text-base">{`${user.firstName} ${user.lastName}`}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="text-base">
                  <a
                    href={`mailto:${user.email}`}
                    className="text-primary hover:underline"
                  >
                    {user.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created
                </dt>
                <dd className="text-base">
                  {user.createdAt.toLocaleString("en-US", { timeZone: "UTC" })} (in UTC)
                </dd>
              </div>
            </dl>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This data is fetched from your{" "}
                <a
                  href="/edit/development/models/user"
                  className="text-primary hover:underline"
                >
                  user
                </a>{" "}
                via your autogenerated API.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
