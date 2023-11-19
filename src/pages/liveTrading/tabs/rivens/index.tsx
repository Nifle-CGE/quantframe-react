import { Image, Group, Stack, NumberInput, Divider, Tooltip, ActionIcon, Text, Box, useMantineTheme, Grid } from "@mantine/core";
import { useCacheContext, useStockContextContext } from "@contexts/index";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useTranslatePage } from "@hooks/index";
import api, { wfmThumbnail } from "@api/index";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faComment, faEdit, faHammer, faMagnifyingGlass, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useMutation } from "@tanstack/react-query";
import { RivenAttributes } from "@components/auction/rivenAttributes";
import { CreateStockRivenEntryDto, StockRivenDto } from "$types/index";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { RivenForm } from "@components/forms/riven.form";
import { useNavigate } from "react-router-dom";
import { getOrderStatusColor, paginate, sortArray } from "@utils/index";
import { SearchField } from "@components/searchfield";
import { TextColor } from "@components/textColor";
import { InfoBox } from "@components/InfoBox";
interface StockRivenPanelProps {
}
export const StockRivenPanel = ({ }: StockRivenPanelProps) => {
  const useTranslateRivenPanel = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslatePage(`live_trading.tabs.riven.${key}`, { ...context }, i18Key)
  const useTranslateButtons = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslateRivenPanel(`buttons.${key}`, { ...context }, i18Key)
  const useTranslateNotifaications = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslateRivenPanel(`notifaications.${key}`, { ...context }, i18Key)
  const useTranslateDataGrid = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslateRivenPanel(`datagrid.${key}`, { ...context }, i18Key)
  const useTranslateDataGridColumns = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslateDataGrid(`columns.${key}`, { ...context }, i18Key);
  const useTranslateDataGridContextMenu = (key: string, context?: { [key: string]: any }, i18Key?: boolean) => useTranslateDataGrid(`context_menu.${key}`, { ...context }, i18Key);

  const go = useNavigate();

  const theme = useMantineTheme();
  const { rivens } = useStockContextContext();
  const { riven_items, riven_attributes } = useCacheContext();


  // States For DataGrid
  const [page, setPage] = useState(1);
  const pageSizes = [5, 10, 15, 20, 25, 30, 50, 100];
  const [pageSize, setPageSize] = useState(pageSizes[4]);
  const [rows, setRows] = useState<StockRivenDto[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'listed_price', direction: 'desc' });
  const [query, setQuery] = useState<string>("");

  // Update DataGrid Rows
  useEffect(() => {
    if (!rivens)
      return;
    let rivensFilter = rivens.map((r) => {
      return {
        ...r,
        listed_price: r.listed_price || 0,
      }
    });
    if (query !== "") {
      rivensFilter = rivensFilter.filter((riven) => riven.weapon_name.toLowerCase().includes(query.toLowerCase()));
    }

    setTotalRecords(rivensFilter.length);
    rivensFilter = sortArray([{
      field: sortStatus.columnAccessor,
      direction: sortStatus.direction
    }], rivensFilter);
    rivensFilter = paginate(rivensFilter, page, pageSize);
    setRows(rivensFilter);
  }, [rivens, query, pageSize, page, sortStatus])
  const RivenNameCom = ({ weapon_url, mod_name }: { mod_name: string, weapon_url: string }) => {
    const riven = riven_items.find(x => x.url_name === weapon_url);
    return (
      <Group >
        <Image width={48} height={48} fit="contain" src={wfmThumbnail(riven?.icon || "")} />
        {riven?.item_name || ""} {mod_name}
      </Group>
    );
  }
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});


  const sellRiveEntryMutation = useMutation((data: { id: number, price: number }) => api.stock.riven.sell(data.id, data.price), {
    onSuccess: async (data) => {
      console.log(data);

      notifications.show({
        title: useTranslateNotifaications("sell_title"),
        icon: <FontAwesomeIcon icon={faCheck} />,
        message: useTranslateNotifaications("sell_message", { name: `${data.weapon_name} ${data.mod_name}`, price: data.listed_price }),
        color: "green"
      });
    },
    onError: () => { },
  })
  const updateRiveEntryMutation = useMutation((data: { id: number, riven: Partial<StockRivenDto> }) => api.stock.riven.update(data.id, data.riven), {
    onSuccess: async (data) => {
      notifications.show({
        title: useTranslateNotifaications("update_title"),
        icon: <FontAwesomeIcon icon={faCheck} />,
        message: useTranslateNotifaications("update_message", { name: `${data.weapon_name} ${data.mod_name}` }),
        color: "green"
      });
    },
    onError: () => { },
  })
  const deleteInvantoryEntryMutation = useMutation((id: number) => api.stock.riven.delete(id), {
    onSuccess: async (data) => {
      notifications.show({
        title: useTranslateNotifaications("delete_title"),
        icon: <FontAwesomeIcon icon={faCheck} />,
        message: useTranslateNotifaications("delete_message", { name: `${data.weapon_name} ${data.mod_name}` }),
        color: "green"
      });
    },
    onError: () => { },
  })
  const createRivenEntryMutation = useMutation((data: CreateStockRivenEntryDto) => api.stock.riven.create(data), {
    onSuccess: async (data) => {
      notifications.show({
        title: useTranslateNotifaications("create_title"),
        icon: <FontAwesomeIcon icon={faCheck} />,
        message: useTranslateNotifaications("create_message", { name: `${data.name} ${data.mod_name}` }),
        color: "green"
      });
    },
    onError: () => { },
  })
  return (
    <Stack mt={20}>
      <Grid>
        <Grid.Col span={10}>
          <SearchField value={query} onChange={(text) => setQuery(text)}
            rightSectionWidth={75}
            rightSection={
              <>
                <Tooltip label={useTranslateButtons('create')}>
                  <ActionIcon variant="filled" color="blue.7" onClick={() => {
                    modals.open({
                      size: "100%",
                      withCloseButton: false,
                      children: <RivenForm
                        availableRivens={riven_items}
                        availableAttributes={riven_attributes}
                        onSubmit={(data) => {
                          createRivenEntryMutation.mutate({
                            item_id: data.url_name,
                            rank: data.mod_rank,
                            price: data.price,
                            mod_name: data.mod_name,
                            attributes: data.attributes,
                            mastery_rank: data.mastery_rank,
                            re_rolls: data.re_rolls,
                            polarity: data.polarity,
                            match_riven: {},
                          });
                        }}
                      />,
                    });
                  }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={useTranslateButtons('create_wtb_message')}>
                  <ActionIcon variant="filled" color="blue.7" onClick={() => {
                    go("riven_wtb_message");
                  }}>
                    <FontAwesomeIcon icon={faComment} />
                  </ActionIcon>
                </Tooltip>
              </>
            }
          />
          <Group mt={15} >
            <InfoBox text={useTranslateRivenPanel("infos.to_low_profit_description")} color={theme.colors.orange[7]} />
            <InfoBox text={useTranslateRivenPanel("infos.pending_description")} color={theme.colors.violet[7]} />
            <InfoBox text={useTranslateRivenPanel("infos.live_description")} color={theme.colors.green[7]} />
            <InfoBox text={useTranslateRivenPanel("infos.inactive_description")} color={theme.colors.red[7]} />
            <InfoBox text={useTranslateRivenPanel("infos.no_offers_description")} color={theme.colors.pink[7]} />
          </Group>
        </Grid.Col>
        <Grid.Col span={2} p={0}>
          <Stack spacing={1} h={"100%"} w={"100%"}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextColor size={"lg"} i18nKey={useTranslateRivenPanel("total_purchase_price", undefined, true)} values={{ price: rivens?.reduce((a, b) => a + (b.price || 0), 0) || 0 }} />
            <TextColor size={"lg"} i18nKey={useTranslateRivenPanel("total_listed_price", undefined, true)} values={{ price: rivens?.reduce((a, b) => a + (b.listed_price || 0), 0) || 0 }} />
          </Stack>
        </Grid.Col>
      </Grid>
      <DataTable
        sx={{ marginTop: "20px" }}
        striped
        mah={5}
        height={"63.4vh"}
        records={rows}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRecords}
        recordsPerPage={pageSize}
        recordsPerPageOptions={pageSizes}
        onRecordsPerPageChange={setPageSize}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        withColumnBorders
        rowClassName={(row) => getOrderStatusColor(row.status)}
        rowContextMenu={{
          items: (record) => [
            {
              key: 'copy_wts',
              title: useTranslateDataGridContextMenu('copy_wts'),
              onClick: () => {
                const msg = `WTS [${record.weapon_name} ${record.mod_name}]  ${record.listed_price}p`;
                navigator.clipboard.writeText(msg);
                notifications.show({
                  title: useTranslateNotifaications('copy_wts.title'),
                  message: useTranslateNotifaications('copy_wts.message', { msg: msg }),
                  color: "green",
                });
              },
            },
          ],
        }}
        // define columns
        columns={[
          {
            accessor: 'name',
            title: useTranslateDataGridColumns('name'),
            sortable: true,
            render: ({ weapon_url, mod_name }) =>
              <RivenNameCom weapon_url={weapon_url} mod_name={mod_name} />
          },
          {
            accessor: 'mastery_rank',
            title: useTranslateDataGridColumns('mastery_rank'),
            sortable: true,
          },
          {
            accessor: 'rank',
            title: useTranslateDataGridColumns('rank'),
            sortable: true,
          },
          {
            accessor: 're_rolls',
            title: useTranslateDataGridColumns('re_rolls.title'),
            sortable: true,
            render: ({ id, re_rolls, match_riven }) => <Group grow position="apart" >
              <Text>{re_rolls || 0}</Text>
              <Box w={25} display="flex" sx={{ justifyContent: "flex-end" }}>
                <Tooltip label={match_riven.re_rolls ? useTranslateDataGridColumns('re_rolls.match', { min: match_riven.re_rolls.min, max: match_riven.re_rolls.max }) : useTranslateDataGridColumns('re_rolls.any')}>
                  <ActionIcon size={"sm"} loading={sellRiveEntryMutation.isLoading} color={match_riven.re_rolls ? "green.7" : "blue.7"} variant="filled" onClick={async (e) => {
                    e.stopPropagation();
                    modals.openContextModal({
                      modal: 'prompt',
                      title: useTranslateDataGridColumns("re_rolls.prompt.title"),
                      innerProps: {
                        fields: [
                          {
                            name: 'enabled',
                            description: useTranslateDataGridColumns("re_rolls.prompt.enabled_description"),
                            label: useTranslateDataGridColumns("re_rolls.prompt.enabled_label"),
                            value: !!match_riven.re_rolls,
                            type: 'checkbox',
                          },
                          {
                            name: 'min',
                            description: useTranslateDataGridColumns("re_rolls.prompt.min_description"),
                            label: useTranslateDataGridColumns("re_rolls.prompt.min_label"),
                            type: 'number',
                            value: match_riven.re_rolls?.min || 0,
                            placeholder: useTranslateDataGridColumns("re_rolls.prompt.min_placeholder")
                          },
                          {
                            name: 'max',
                            description: useTranslateDataGridColumns("re_rolls.prompt.max_description"),
                            label: useTranslateDataGridColumns("re_rolls.prompt.max_label"),
                            type: 'number',
                            value: match_riven.re_rolls?.max || 0,
                            placeholder: useTranslateDataGridColumns("re_rolls.prompt.max_placeholder")
                          }
                        ],
                        onConfirm: async (data: { enabled: number, min: number, max: number }) => {
                          if (!id) return;
                          const { enabled, min, max } = data;
                          if (enabled)
                            updateRiveEntryMutation.mutateAsync({ id, riven: { match_riven: { ...match_riven, re_rolls: { min, max } } } })
                          else
                            updateRiveEntryMutation.mutateAsync({ id, riven: { match_riven: { ...match_riven, re_rolls: undefined } } })
                        },
                        onCancel: (id: string) => modals.close(id),
                      },
                    })
                  }} >
                    <FontAwesomeIcon size="xs" icon={faMagnifyingGlass} />
                  </ActionIcon>
                </Tooltip>
              </Box>
            </Group>
          },
          {
            accessor: 'price',
            title: useTranslateDataGridColumns('price'),
            sortable: true,
          },
          {
            accessor: 'minium_price',
            title: useTranslateDataGridColumns('minium_price.title'),
            sortable: true,
            render: ({ id, minium_price }) => <Group grow position="apart" >
              <Text>{minium_price || "N/A"}</Text>
              <Box w={25} display="flex" sx={{ justifyContent: "flex-end" }}>
                <Tooltip label={useTranslateDataGridColumns('minium_price.description')}>
                  <ActionIcon size={"sm"} color={"blue.7"} variant="filled" onClick={async (e) => {
                    e.stopPropagation();
                    modals.openContextModal({
                      modal: 'prompt',
                      title: useTranslateDataGridColumns('minium_price.prompt.title'),
                      innerProps: {
                        fields: [
                          {
                            name: 'minium_price',
                            label: useTranslateDataGridColumns('minium_price.prompt.minium_price_label'),
                            value: minium_price || 0,
                            type: 'number',
                          },
                        ],
                        onConfirm: async (data: { minium_price: number }) => {
                          if (!id) return;
                          const { minium_price } = data;
                          updateRiveEntryMutation.mutateAsync({ id, riven: { minium_price: minium_price == 0 ? -1 : minium_price } })
                        },
                        onCancel: (id: string) => modals.close(id),
                      },
                    })
                  }} >
                    <FontAwesomeIcon size="xs" icon={faEdit} />
                  </ActionIcon>
                </Tooltip>
              </Box>
            </Group>
          },
          {
            accessor: 'listed_price',
            title: useTranslateDataGridColumns('listed_price'),
            sortable: true,
            render: ({ listed_price }) => <Group grow position="apart" >
              <Text>{(listed_price == 0) ? "" : listed_price}</Text>
            </Group>
          },
          {
            accessor: 'attributes',
            title: useTranslateDataGridColumns('attributes'),
            width: "38%",
            render: ({ id, attributes }) =>
              <Group >
                <RivenAttributes isClickable attributes={attributes}
                  onClick={(a) => {
                    if (!id) return;
                    const newAttributes = [...attributes];
                    const index = newAttributes.findIndex(x => x.url_name === a.url_name);
                    if (index === -1) return;
                    a.match = !a.match;
                    newAttributes[index] = a;
                    updateRiveEntryMutation.mutateAsync({ id, riven: { attributes: newAttributes } })
                  }}
                />
              </Group>
          },
          {
            accessor: 'actions',
            width: 180,
            title: useTranslateDataGridColumns('actions.title'),
            render: (row) =>
              <Group grow position="center" >
                <NumberInput
                  required
                  size='sm'
                  min={0}
                  max={999}
                  value={itemPrices[`${row.weapon_url}${row.mod_name}`] || ""}
                  onChange={(value) => setItemPrices({ ...itemPrices, [`${row.weapon_url}${row.mod_name}`]: Number(value) })}
                  rightSectionWidth={110}
                  rightSection={
                    <Group spacing={"5px"} mr={0}>
                      <Divider orientation="vertical" />
                      <Tooltip label={useTranslateDataGridColumns('actions.sell')}>
                        <ActionIcon disabled={!itemPrices[`${row.weapon_url}${row.mod_name}`]} loading={sellRiveEntryMutation.isLoading} color="green.7" variant="filled" onClick={async (e) => {
                          e.stopPropagation();
                          const price = itemPrices[`${row.weapon_url}${row.mod_name}`];
                          if (!price || price <= 0 || !row.id) return;
                          await sellRiveEntryMutation.mutateAsync({ id: row.id, price });
                        }} >
                          <FontAwesomeIcon icon={faHammer} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={useTranslateDataGridColumns('actions.sell_for_listed_price')}>
                        <ActionIcon disabled={!row.listed_price} loading={sellRiveEntryMutation.isLoading} color="blue.7" variant="filled" onClick={async () => {
                          if (!row.listed_price || !row.id) return;
                          await sellRiveEntryMutation.mutateAsync({ id: row.id, price: row.listed_price });
                        }} >
                          <FontAwesomeIcon icon={faHammer} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={useTranslateDataGridColumns('actions.delete.title')}>
                        <ActionIcon color="red.7" variant="filled" onClick={async () => {
                          modals.openConfirmModal({
                            title: useTranslateDataGridColumns('actions.delete.title'),
                            children: (<Text>
                              {useTranslateDataGridColumns('actions.delete.message', { name: `${row.weapon_name} ${row.mod_name}` })}
                            </Text>),
                            labels: {
                              confirm: useTranslateDataGridColumns('actions.delete.buttons.confirm'),
                              cancel: useTranslateDataGridColumns('actions.delete.buttons.cancel')
                            },
                            confirmProps: { color: 'red' },
                            onConfirm: async () => {
                              if (!row.id) return;
                              await deleteInvantoryEntryMutation.mutateAsync(row.id);
                            }
                          })
                        }} >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  }
                />
              </Group>
          },
        ]}
      />
    </Stack>
  )
}