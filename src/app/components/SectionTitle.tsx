"use client";
import { Heading } from "@chakra-ui/react";

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading
      as="h3"
      style={{
        textDecoration: "underline",
        textUnderlineOffset: "6px",
        textDecorationColor: "#525252",
        textDecorationThickness: "4px",
        marginTop: "12px",
        marginBottom: "16px",
        fontSize: "20px",
      }}
    >
      {children}
    </Heading>
  );
}

