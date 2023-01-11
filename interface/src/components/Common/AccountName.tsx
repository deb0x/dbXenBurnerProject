export default function formatAccountName(account: string)
{   
    return `${account.substring(0, 5)}...${account.substring(account.length - 4)}`
}