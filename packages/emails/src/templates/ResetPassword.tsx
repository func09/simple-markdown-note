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

interface ResetPasswordEmailProps {
  resetLink?: string;
  userEmail?: string;
}
/**
 * パスワード再設定リンクを含んだメール本文のReactコンポーネントテンプレート。
 */
export const ResetPasswordEmail = ({
  resetLink = "http://localhost:3000/reset-password?token=example-token",
  userEmail = "user@example.com",
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Reset your password</Preview>
        <Body className="bg-gray-50 font-sans my-auto mx-auto px-4 sm:px-6">
          <Container className="bg-white border border-gray-200 rounded-lg shadow-sm mx-auto my-6 sm:my-10 p-6 sm:p-8 max-w-lg w-full">
            <Section className="text-center mb-6">
              <Text className="text-blue-600 text-2xl font-bold m-0 tracking-tight">
                Simple Markdown Note
              </Text>
            </Section>
            <Heading className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
              Reset your password
            </Heading>
            <Text className="text-gray-600 text-base mb-4 leading-relaxed">
              Hi {userEmail},
            </Text>
            <Text className="text-gray-600 text-base mb-6 leading-relaxed">
              We received a request to reset your password. Click the button
              below to choose a new one.
            </Text>
            <Section className="text-center mb-8">
              <Button
                className="bg-blue-600 text-white font-semibold rounded px-6 py-3 text-center inline-block"
                href={resetLink}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-gray-500 text-sm mb-4 leading-relaxed">
              If you didn't request a password reset, you can safely ignore this
              email. Your password will remain unchanged.
            </Text>
            <Text className="text-gray-500 text-xs sm:text-sm leading-relaxed break-all">
              If the button doesn't work, copy and paste the following link into
              your browser:
              <br />
              <Link href={resetLink} className="text-blue-600 underline">
                {resetLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;
