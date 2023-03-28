import { Action, ActionPanel } from '@raycast/api'
import type { Secret } from '@scaleway/sdk'
import { getSecretUrl } from './urls'
import { SecretVersions } from './pages'

type SecretActionProps = {
  secret: Secret.v1alpha1.Secret
  toggleIsDetailOpen: () => void
}

export const SecretsAction = ({ secret, toggleIsDetailOpen }: SecretActionProps) => (
  <ActionPanel>
    <Action.Push
      title="See Versions"
      shortcut={{ modifiers: ['cmd'], key: 'enter' }}
      target={<SecretVersions secret={secret} />}
    />
    <Action title="More Information" onAction={toggleIsDetailOpen} />
    <Action.OpenInBrowser url={getSecretUrl(secret)} />
    <Action.CopyToClipboard title="Copy ID" content={secret.id} />
    <Action.CopyToClipboard title="Copy URL" content={getSecretUrl(secret)} />
  </ActionPanel>
)
