import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import FinishedGames from "./FinishedGames";
import CurrentChallenges from "./CurrentChallenges";
import CurrentGames from "./CurrentGames";

export default function HomeView() {
  return (
    <Tabs isLazy colorScheme="purple">
      <TabList>
        <Tab>Challenges</Tab>
        <Tab>Ongoing</Tab>
        <Tab>Finished</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <CurrentChallenges />
        </TabPanel>
        <TabPanel>
          <CurrentGames />
        </TabPanel>
        <TabPanel>
          <FinishedGames />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
