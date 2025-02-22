import { Maybe } from '@metafam/utils';
import { ConnectedPage } from 'components/ConnectedPage';
import { PageContainer } from 'components/Container';
import {
  ALL_BOXES,
  DEFAULT_DASHBOARD_LAYOUT_DATA,
} from 'components/Dashboard/config';
import { DashboardSection } from 'components/Dashboard/DashboardSection';
import { EditableGridLayout } from 'components/EditableGridLayout';
import {
  Player,
  useUpdatePlayerDashboardLayoutMutation as useUpdateLayout,
} from 'graphql/autogen/types';
import React, { useCallback, useMemo } from 'react';
import { DisplayOutput, LayoutData } from 'utils/boxTypes';

const ConnectedDashboardPage: React.FC<Props> = () => (
  <ConnectedPage page={DashboardPage} pageLabel="Your Dashboard" />
);

export default ConnectedDashboardPage;

type Props = { player: Maybe<Player> };

export const DashboardPage: React.FC<Props> = ({ player }) => {
  const [{ fetching: persisting }, saveLayoutData] = useUpdateLayout();
  const savedLayoutData = useMemo<LayoutData>(
    () =>
      player?.dashboardLayout
        ? JSON.parse(player?.dashboardLayout)
        : DEFAULT_DASHBOARD_LAYOUT_DATA,
    [player?.dashboardLayout],
  );

  const persistLayoutData = useCallback(
    async (layoutData: LayoutData) => {
      if (player) {
        const { error } = await saveLayoutData({
          playerId: player.id,
          dashboardLayout: JSON.stringify(layoutData),
        });

        if (error) throw error;
      }
    },
    [saveLayoutData, player],
  );

  if (!player) return null;

  return (
    <PageContainer>
      <EditableGridLayout
        {...{
          player: player as Player,
          defaultLayoutData: DEFAULT_DASHBOARD_LAYOUT_DATA,
          savedLayoutData,
          showEditButton: true,
          persistLayoutData,
          persisting,
          allBoxOptions: ALL_BOXES,
          displayComponent: DashboardSection as DisplayOutput,
        }}
      />
    </PageContainer>
  );
};
