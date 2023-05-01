import { Tabs, TabList, TabPanels, Tab, TabPanel, Box } from "@chakra-ui/react";
import FinishedGames from "./FinishedGames";
import CurrentChallenges from "./CurrentChallenges";
import CurrentGames from "./CurrentGames";

export default function HomeView() {
  return (
    // <Tabs isLazy colorScheme="purple">
    //   <TabList>
    //     <Tab>Challenges</Tab>
    //     <Tab>Ongoing</Tab>
    //     <Tab>Finished</Tab>
    //   </TabList>

    //   <TabPanels>
    //     <TabPanel>
    <Box px="4" pb="8">
      <CurrentChallenges />
    </Box>
    //     </TabPanel>
    //     <TabPanel>
    //       <CurrentGames />
    //     </TabPanel>
    //     <TabPanel>
    //       <FinishedGames />
    //     </TabPanel>
    //   </TabPanels>
    // </Tabs>
  );
}
