import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useForm, router } from '@inertiajs/react'
import { useState } from "react"

export function AddCustomerForm() {

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: ''
  });

  const [formOpen, setFormOpen] = useState<boolean|undefined>(undefined);

  const submit = (e) => {
    e.preventDefault();
    console.log('data: ', data);
    
    post(route('customers.store'), {
        onError: (error) => {
            console.log('error', error)
            console.log('errors', errors)
        }
    })
  }

  return (
    <Sheet open={formOpen} onOpenChange={(v) => setFormOpen(v)}>
      <SheetTrigger asChild>
        <Button onClick={() => setFormOpen(true)}>Add a customer</Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="p-6">
        <SheetHeader className="items-center">
          <SheetTitle>Add New Customer</SheetTitle>
        </SheetHeader>
        {/* <form onSubmit={submit}> */}
        <div className="grid gap-4 py-4 mt-6">
          <div className="flex flex-col gap-2">
            <Label className="pl-0.5" htmlFor="name">
              Name
            </Label>
            <Input 
                id="name" 
                className="col-span-3"
                value={data.name} 
                onChange={e => setData('name', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="pl-0.5" htmlFor="email">
              Email
            </Label>
            <Input
                id="email"
                className="col-span-3"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="pl-0.5" htmlFor="phone">
              Phone
            </Label>
            <Input
                id="phone"
                className="col-span-3"
                value={data.phone}
                onChange={e => setData('phone', e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button 
                type="button"
                onClick={submit}
            >
                Submit
            </Button>
          </SheetClose>
        </SheetFooter>
        {/* </form> */}
      </SheetContent>
    </Sheet>
  )
}
