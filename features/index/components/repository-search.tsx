import { Search } from "lucide-react"

type SearchRepositoryProps = {
    value: string
    onChange: (value: string ) => void;
}


export function SearchRepository(
    { value, onChange } : SearchRepositoryProps
) {

    return (
        <div  className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input 
                value={value}
                onChange={(event) => onChange( event.target.value)} // calling the onChange function prop
                placeholder="Search Repositories..."
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search repositories"
            />
        </div>
    )
}