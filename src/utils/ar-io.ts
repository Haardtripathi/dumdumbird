// @typescript-eslint / no - explicit - any
import { gql } from 'ar-gql';
import { arweave } from 'arweave';

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

export async function getHighScores() {
    const query = gql`
    query {
      transactions(
        tags: [
          { name: "Action", values: "SaveScore" }
        ]
        first: 10
        sort: HEIGHT_DESC
      ) {
        edges {
          node {
            id
            tags {
              name
              value
            }
          }
        }
      }
    }
  `;

    const result = await arweave.api.post('arql', query);
    return result.data.transactions.edges.map((edge: unknown) => ({
        id: edge.node.id,
        score: edge.node.tags.find((tag: unknown) => tag.name === 'Score').value,
    }));
}