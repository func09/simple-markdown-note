import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  verifyLink?: string;
  userEmail?: string;
}

export const VerifyEmail = ({
  verifyLink = "http://localhost:3000/verify-email?token=example-token",
  userEmail = "user@example.com",
}: VerifyEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Verify your email address</Preview>
        <Body className="bg-gray-50 font-sans my-auto mx-auto px-4 sm:px-6">
          <Container className="bg-white border border-gray-200 rounded-lg shadow-sm mx-auto my-6 sm:my-10 p-6 sm:p-8 max-w-lg w-full">
            <Section className="text-center mb-6">
              <Text className="text-blue-600 text-2xl font-bold m-0 tracking-tight">
                Simple Markdown Note
              </Text>
            </Section>
            <Heading className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
              Verify your email address
            </Heading>
            <Text className="text-gray-600 text-base mb-4 leading-relaxed">
              Hi {userEmail},
            </Text>
            <Text className="text-gray-600 text-base mb-6 leading-relaxed">
              Thank you for registering! Please verify your email address by
              clicking the button below.
            </Text>
            <Section className="text-center mb-8">
              <Button
                className="bg-blue-600 text-white font-semibold rounded px-6 py-3 text-center inline-block"
                href={verifyLink}
              >
                Verify Email Address
              </Button>
            </Section>
            <Text className="text-gray-500 text-sm mb-4 leading-relaxed">
              If you didn't create an account, you can safely ignore this email.
            </Text>
            <Text className="text-gray-500 text-xs sm:text-sm leading-relaxed break-all">
              If the button doesn't work, copy and paste the following link into
              your browser:
              <br />
              <Link href={verifyLink} className="text-blue-600 underline">
                {verifyLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
