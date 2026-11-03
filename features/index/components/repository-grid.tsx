
import { RepositoryCard, type IndexedRepository  } from "./repository-card";


type RepositoryGridProps = {
    repositories: IndexedRepository[];
    onSelectRepository?: (repository: IndexedRepository) => void;
};

export function RepositoryGrid(
    { repositories, onSelectRepository }: RepositoryGridProps 
) {
    if (repositories.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            { repositories.map( (repository) => (
                <RepositoryCard 
                    key={repository.id}
                    repository={repository}
                    onSelect={onSelectRepository}
                />
            ))}
        </div>
    )
}
