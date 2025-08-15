'use client';

import { HStack, Box, Text } from '@chakra-ui/react';

import type { JSX } from 'react';

export default function TechBadge({
  label,
  count,
}: {
  label: string;
  count?: number;
}): JSX.Element {
  return (
    <HStack
      as="span"
      gap={1}
      px="2"
      py="0.5"
      borderWidth="1px"
      rounded="full"
      lineHeight="1"
    >
      <Text as="span" fontSize="xs">
        {label}
      </Text>
      {typeof count === 'number' ? (
        <Box as="span" fontSize="xs" opacity={0.7}>
          {count}m
        </Box>
      ) : null}
    </HStack>
  );
}
