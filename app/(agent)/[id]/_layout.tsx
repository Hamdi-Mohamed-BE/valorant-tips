import { Stack } from 'expo-router';

export default function AgentLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Agent Details',
          headerStyle: {
            backgroundColor: '#FF4655',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
} 