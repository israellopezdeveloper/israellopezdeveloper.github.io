import { Badge, Box, useColorModeValue } from '@chakra-ui/react';

const TechBadge = ({ tech, usage = 0, isSelected, onToggle }) => {
  return (
    <Box onClick={() => onToggle(tech)} cursor="pointer">
      <Badge colorScheme={isSelected ? 'green' : 'red'} px={1} py={0} m={0}>
        {tech}{usage > 0 ? ' (' + usage + ')' : ''}
      </Badge>
    </Box>
  );
};

export default TechBadge;

