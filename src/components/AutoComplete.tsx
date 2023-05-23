import React, { type SetStateAction, useState, useRef, useEffect, useImperativeHandle } from "react"
import { type CommandSuggestion, commands } from "~/constants/commandAutocomplete";

interface IProps {
    command: string;
    loading: boolean;
    setCommand: (value: SetStateAction<string>) => void
}

export const AutoComplete = React.forwardRef<HTMLInputElement, IProps>((
    {command, loading, setCommand}, ref) => {

    const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([])
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [suggestionsActive, setSuggestionsActive] = useState(false);
    const localInputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => localInputRef.current as HTMLInputElement);

    const handleClickOutside = (event: Event): void => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
            setSuggestions([]);
            setSuggestionIndex(0)
            setSuggestionsActive(false);
        }
    };
    
    useEffect(() => {
        document.addEventListener("click", handleClickOutside, false);
        return () => {
            document.removeEventListener("click", handleClickOutside, false);
        };
    }, []);

    function setScroll() {
        const selected = selectRef?.current?.querySelector(".active");
        if (selected) {
            selected?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCommand(query);

        if (query.length > 0) {
            const filterSuggestions = commands.filter(
                (item) => item.command.toLowerCase().indexOf(query.toLowerCase()) > -1
            );
            setSuggestions(filterSuggestions);
            filterSuggestions.length > 0 ? setSuggestionsActive(true) : setSuggestionsActive(false);
            
            if (suggestionIndex > filterSuggestions.length) setSuggestionIndex(0);
        } else {
            setSuggestionsActive(false);
        }
    };

    const handleClick = (selectedCommand: string) => {
        setSuggestions([]);
        setSuggestionIndex(0)
        setSuggestionsActive(false);
        setCommand(selectedCommand);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // UP ARROW
        if (e.key === "ArrowUp") {
            if (suggestionIndex !== 0) {
                setSuggestionIndex(suggestionIndex - 1);
            }
        }

        // DOWN ARROW
        else if (e.key === "ArrowDown") {
            if (suggestionIndex !== suggestions.length - 1) {
                setSuggestionIndex(suggestionIndex + 1);
            }
        }

        // ENTER
        else if (e.key === "Enter") {
            if (suggestionsActive && suggestions) {
                setCommand(suggestions[suggestionIndex]?.command ?? "");
                setSuggestions([]);
                setSuggestionIndex(0);
                setSuggestionsActive(false);
                e.preventDefault();
            }
        }
    };
    

    return (
        <div>
            <input
                ref={localInputRef}
                type="text"
                className="w-full px-0 py-[9px] pb-[18px] text-sm text-[#fff] 
                font-normal placeholder:text-sm placeholder:text-[#616161]"
                placeholder="Start by typing the command eg. run-query"
                value={command}
                disabled={loading}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
            />

            {suggestionsActive && <div className="absolute w-[400px] h-[max] max-h-[145px] overflow-y-auto py-1
                bg-[#272628] border border-solid border-[#333] shadow-[0px_4px_4px_rgba(0, 0, 0, 0.25)] 
                flex-col gap-2 bottom-0"
                style={{
                    left: (command.length * 10) + 10,
                }}
                ref={selectRef}
            >
                {suggestions.map((item, index) => {
                    setTimeout(() => {
                        setScroll();
                    }, 100);

                    return (
                        <div 
                            className={`px-3 py-1 flex justify-between items-center cursor-pointer 
                            hover:bg-[#373737] ${index === suggestionIndex ? "bg-[#373737] active" : ""}`}
                            key={index}
                            onClick={() => handleClick(item.command)}
                        >
                            <p className="text-[#fff] text-sm">
                                {item.command}
                            </p>
                            <p className="text-xs text-[#C4C4C4]">{item.description}</p>
                        </div>
                    )
                }
            )}
            </div>}
        </div>
    )
});

AutoComplete.displayName = "AutoComplete"

export default AutoComplete;