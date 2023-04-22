import {
  Button,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import MintAndPostForm from "./MintAndPostForm";
import PostNutsForm from "./PostNutsForm";

export default function PostRewardForm() {
  const toast = useToast();

  return (
    <Tabs colorScheme="purple">
      <TabList>
        <Tab>Pay with lightning</Tab>
        <Tab>Send Cashu token</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <MintAndPostForm />
        </TabPanel>
        <TabPanel>
          <PostNutsForm />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
