import { Action, ActionPanel, List, Clipboard, showToast, Toast } from '@raycast/api'
import { Errors, Secret } from '@scaleway/sdk'
import { useAPI } from 'src/providers'
import { useSecretVersionsQuery } from '../queries'
import { getVersionStatusIcon } from '../status'
import { toByteArray } from 'base64-js'

type SecretVersionsProps = {
  secret: Secret.v1alpha1.Secret
}

export const SecretVersions = ({ secret }: SecretVersionsProps) => {
  const { data: versions, isLoading } = useSecretVersionsQuery(
    {
      secretId: secret.id,
      region: secret.region,
    },
    {
      initialData: [],
    }
  )
  const { secretManager } = useAPI()
  const isListLoading = isLoading && !versions

  const copyVersionValue = async (version: Secret.v1alpha1.SecretVersion) => {
    try {
      const value = await secretManager.accessSecretVersion({
        revision: String(version.revision),
        secretId: secret.id,
        region: secret.region,
      })

      const decoded = new TextDecoder().decode(toByteArray(value.data))

      await Clipboard.copy(decoded)
      await showToast({
        title: 'Secret Version value copied to clipboard',
        style: Toast.Style.Success,
      })
    } catch (error) {
      if (error instanceof Errors.ScalewayError) {
        await showToast({
          title: error.message,
          style: Toast.Style.Failure,
        })
      }
    }
  }

  return (
    <List
      isShowingDetail
      isLoading={isListLoading}
      searchBarPlaceholder="Filter logs by content..."
      navigationTitle={secret.name}
    >
      {(versions || []).map((version) => (
        <List.Item
          key={version.revision}
          title={String(version.revision)}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Status"
                    text={version.status}
                    icon={getVersionStatusIcon(version)}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Version"
                    text={String(version.revision)}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Updated At"
                    text={version.updatedAt?.toDateString()}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Created At"
                    text={version.createdAt?.toDateString()}
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action
                title="Copy Secret Version value"
                onAction={() => copyVersionValue(version)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  )
}
