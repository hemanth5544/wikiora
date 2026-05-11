import { SignUp } from "@clerk/clerk-react"

import { Eyebrow } from "@/components/typography/Eyebrow"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <Eyebrow>Create account</Eyebrow>
        <CardTitle>Join Wikiora</CardTitle>
        <CardDescription>Start collaborating in shared workspaces.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </CardContent>
    </Card>
  )
}
