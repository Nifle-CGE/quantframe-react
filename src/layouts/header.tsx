import { Avatar, Group, Header, Menu, createStyles, rem, Container, ActionIcon, useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useTranslateLayout } from "@hooks/index";
import { SettingsModal } from "@components/modals/settings";
import { DeepPartial, Settings, Wfm } from "$types/index";
import { faGear } from "@fortawesome/free-solid-svg-icons/faGear";
import { modals } from "@mantine/modals";
import { Logo } from "../components/logo";
import Clock from "../components/clock";
import api, { wfmThumbnail } from "@api/index";
import { useAppContext, useCacheContext } from "../contexts";
import { notifications } from "@mantine/notifications";
interface TopMenuProps {
  opened: boolean;
  user: Wfm.UserDto | undefined;
  onOpenedClick: () => void;
  hideSidebar: boolean;
  setHideSidebar: (show: boolean) => void;
}

const HEADER_HEIGHT = rem(50);

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  }

}));

export default function Hedder({ user }: TopMenuProps) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [, setUserMenuOpened] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const { settings } = useAppContext();
  const { items } = useCacheContext();

  useEffect(() => {
    setAvatar(`${wfmThumbnail(user?.avatar || "")}`);
  }, [user?.avatar]);

  const useTranslateHedder = (key: string, context?: { [key: string]: any }) => useTranslateLayout(`header.${key}`, { ...context })

  const handleUpdateSettings = async (settingsData: DeepPartial<Settings>) => {
    if (!settingsData) return;
    const data = { ...settings, ...settingsData } as Settings;
    await api.base.updatesettings(data as any); // add 'as any' to avoid type checking
    notifications.show({
      title: useTranslateHedder("notifications.settings_updated"),
      message: useTranslateHedder("notifications.settings_updated_message"),
      color: 'green',
      autoClose: 5000,
    });
  }


  return (
    <Header height={HEADER_HEIGHT} sx={{ borderBottom: 0 }} mb={120}>
      <Container className={classes.inner} fluid>
        <Group>
          <Group position="left" grow>
            <Logo title={useTranslateHedder("title")} color={theme.colors.blue[7]} />
          </Group>
        </Group>
        <Clock />
        <Group spacing={20}>
          {user && (
            <Menu
              width={"auto"}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
            >
              <Menu.Target>
                <ActionIcon color="pink" size="xs">
                  <Avatar variant="subtle" src={avatar} alt={user.ingame_name} radius="xl" size={"sm"} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item icon={<Avatar variant="subtle" src={avatar} alt={user.ingame_name} radius="xl" size={"sm"} />}>
                  {user.ingame_name}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item icon={<FontAwesomeIcon icon={faGear} />} onClick={async () => {
                  modals.open({
                    size: "100%",
                    withCloseButton: false,
                    children: <SettingsModal settings={settings} updateSettings={handleUpdateSettings} tradable_items={items} />,
                  })
                }}>
                  {useTranslateHedder("profile.settings")}
                </Menu.Item>
                <Menu.Item icon={<FontAwesomeIcon icon={faFolder} />} onClick={async () => {
                  await api.base.openLogsFolder();
                }}>
                  {useTranslateHedder("profile.open_logs_folder")}
                </Menu.Item>
                <Menu.Item icon={<FontAwesomeIcon icon={faRightFromBracket} />}>
                  {useTranslateHedder("profile.logout")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>)}
        </Group>
      </Container>
    </Header>
  )
}