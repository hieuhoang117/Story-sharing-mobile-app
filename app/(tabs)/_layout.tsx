
import MainMenu from '@/components/Main-menu/Main-menu';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <MainMenu />
  );
}
