import { Box, Button, Code, CopyButton, Divider, Flex, Image, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useWalletModalStore } from "@nelver/client/components/YourWalletModal/store";
import { api, type RouterOutputs } from "@nelver/utils/api";
import { IconCopy } from "@tabler/icons-react";
import { useState } from "react";

const NewWallet = () => {
  const [newWallet, setNewWallet] = useState<RouterOutputs["wallet"]["create"] | null>(null);
  const { mutate } = api.wallet.create.useMutation({
    onSuccess: setNewWallet,
  });

  return (
    <Box>
      <Text>Click button below to get your new wallet.</Text>
      {newWallet ? (
        <Box>
          <Text>Wallet created successfully!</Text>
          <Divider style={{ marginTop: 10, marginBottom: 10 }} />
          <Text fw="bold">Please keep your private key below carefully, you will never see this key again!!!</Text>

          <Flex columnGap="md" align="center" wrap="nowrap">
            <Code color="blue" fz="sm" sx={{ display: "flex", alignItems: "center" }}>
              {newWallet.privateKey}{" "}
              <CopyButton value={newWallet.privateKey}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"}>
                    <IconCopy cursor="pointer" onClick={copy} />
                  </Tooltip>
                )}
              </CopyButton>
            </Code>
          </Flex>
        </Box>
      ) : (
        <Button onClick={() => void mutate()} size="md" fullWidth style={{ marginTop: 10 }}>
          Create a new wallet
        </Button>
      )}
    </Box>
  );
};

const ImportWallet = () => {
  const { importedWallet, setImportedWallet } = useWalletModalStore();
  const [privateKey, setPrivateKey] = useState("");
  const { mutate } = api.wallet.import.useMutation({
    onSuccess: setImportedWallet,
  });
  const isImported = !!importedWallet;

  api.wallet.info.useQuery(void 0, {
    enabled: isImported,
    initialData: importedWallet,
    onSuccess: setImportedWallet,
  });

  console.log(isImported, importedWallet);

  if (isImported && importedWallet) {
    return (
      <Box>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <Flex columnGap="xs" align="center" wrap="nowrap">
          <Text fw="bold">Address:</Text>
          <Text fz="sm"> {importedWallet.address}</Text>
        </Flex>
        <Flex columnGap="xs" align="center" wrap="nowrap">
          <Text fw="bold">Balance:</Text>
          <Text fz="sm"> {importedWallet.balance} NEL</Text>
        </Flex>
        <Flex columnGap="xs" align="center" wrap="nowrap">
          <Text fw="bold">Name:</Text>
          <Text fz="sm"> {importedWallet.nevMetadata?.name}</Text>
        </Flex>
        <Image src={importedWallet.nevMetadata?.image} alt="Wallet avatar" style={{ width: 100, height: 100 }} />
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
      </Box>
    );
  }

  return (
    <Box>
      <TextInput
        placeholder="Enter your private key to import your wallet"
        value={privateKey}
        onChange={(event) => setPrivateKey(event.currentTarget.value)}
        radius="md"
      />
      <Button onClick={() => mutate({ privateKey })} size="md" fullWidth style={{ marginTop: 10 }}>
        Import Wallet
      </Button>
    </Box>
  );
};

export function YourWalletModal() {
  const { mutateAsync } = api.auth.checkWalletExists.useMutation();
  const { importedWallet } = useWalletModalStore();

  console.log("importedWallet", importedWallet);

  return (
    <Button
      onClick={() => {
        mutateAsync()
          .then((hasWallet) => {
            modals.open({
              size: "xl",
              centered: true,
              title: <Title order={3}>{importedWallet ? "Your" : hasWallet ? "Import" : "Create"} Nelver Wallet</Title>,
              children: <Box>{hasWallet ? <ImportWallet /> : <NewWallet />}</Box>,
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }}
    >
      Your Wallet
    </Button>
  );
}
